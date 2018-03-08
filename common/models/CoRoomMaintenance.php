<?php

namespace common\models;

use common\models\query\CoRoomMaintenanceQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_room_maintenance".
 *
 * @property integer $maintain_id
 * @property integer $tenant_id
 * @property string $maintain_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoRoomMaintenance extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_room_maintenance';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['maintain_name'], 'required'],
            [['tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['maintain_name'], 'string', 'max' => 50],
            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'maintain_name', 'deleted_at'], 'message' => 'The combination of Maintain Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'maintain_id' => 'Maintain ID',
            'tenant_id' => 'Tenant ID',
            'maintain_name' => 'Room Maintain Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoRoomMaintenanceQuery(get_called_class());
    }

    public static function getMaintenanceList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

}
