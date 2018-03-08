<?php

namespace common\models;

use common\models\query\CoAlertQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_alert".
 *
 * @property integer $alert_id
 * @property integer $tenant_id
 * @property string $alert_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoAlert extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_alert';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['alert_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['alert_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'alert_id' => 'Alert ID',
            'tenant_id' => 'Tenant ID',
            'alert_name' => 'Alert Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoAlertQuery(get_called_class());
    }

    public static function getAlertlist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Alert Added Successfully (#' . $this->alert_name . ' )';
        else
            $activity = 'Alert Updated Successfully (#' . $this->alert_name . ' )';
        CoAuditLog::insertAuditLog(CoAlert::tableName(), $this->alert_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
