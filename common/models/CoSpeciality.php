<?php

namespace common\models;

use common\models\query\CoSpecialityQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_speciality".
 *
 * @property integer $speciality_id
 * @property integer $tenant_id
 * @property string $speciality_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoTenant $tenant
 */
class CoSpeciality extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_speciality';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['speciality_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at'], 'safe'],
                [['speciality_name'], 'string', 'max' => 50],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'speciality_name', 'deleted_at'], 'message' => 'The combination of Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'speciality_id' => 'Speciality ID',
            'tenant_id' => 'Tenant ID',
            'speciality_name' => 'Speciality Name',
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
        return new CoSpecialityQuery(get_called_class());
    }

    public static function getSpecialityList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Speciality Added Successfully (#' . $this->speciality_name . ' )';
        else
            $activity = 'Speciality Updated Successfully (#' . $this->speciality_name . ' )';
        CoAuditLog::insertAuditLog(CoSpeciality::tableName(), $this->speciality_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
